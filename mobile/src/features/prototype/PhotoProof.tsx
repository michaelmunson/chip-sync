import { useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import type { Profile } from '@chip-sync/api';
import { Button, Card, Label } from '../../components/primitives';
import { createNativePhotos, type PreparedPhoto } from '../../platform/photos';

/** One persisted proof key per account makes interrupted uploads discoverable for cleanup. */
export function PhotoProof({ profile, active }: { profile: Profile; active: boolean }) {
  const [photos] = useState(createNativePhotos);
  const [photo, setPhoto] = useState<PreparedPhoto>();
  const [path, setPath] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [progress, setProgress] = useState(0);
  const lock = useRef(false);
  const mounted = useRef(true);
  const storageKey = `@chip-sync/prototype-photo/${profile.id}`;
  useEffect(() => {
    mounted.current = true;
    AsyncStorage.getItem(storageKey).then(value => {
      if (mounted.current) setPath(value);
    }).catch(() => { if (mounted.current) setError('Could not recover the proof photo. Please reopen this screen.'); })
      .finally(() => { if (mounted.current) setBusy(false); });
    return () => { mounted.current = false; photos.dispose(); };
  }, [photos, storageKey]);
  useEffect(() => {
    let current = true;
    setUrl('');
    if (active && path) photos.resolve(path).then(value => { if (current) setUrl(value); }).catch(() => {
      if (current) setError('Photo unavailable. Retry its upload or delete the interrupted proof.');
    });
    return () => { current = false; };
  }, [active, path, photos]);

  const perform = async (operation: () => Promise<void>) => {
    if (lock.current || busy || !active) return;
    lock.current = true;
    setBusy(true); setError('');
    try { await operation(); }
    catch (error) { if (mounted.current) setError(error instanceof Error ? error.message : 'Photo operation failed. Please retry.'); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  return <Card>
    <Label>Photo upload check</Label>
    <Label>This uploads one test photo without attaching it to a site or request. Delete it after checking.</Label>
    {error ? <Label error>{error}</Label> : null}
    {url ? <Image accessibilityLabel="Uploaded proof photo" source={{ uri: url }} style={{ height: 180, borderRadius: 10 }} onError={() => setError('Image URL expired or download failed. Refresh the photo.')} /> : null}
    {!path && <Button title={photo ? `Selected: ${photo.name}` : 'Choose a photo'} disabled={busy || !active} onPress={() => void perform(async () => {
      const picked = await photos.pick(1);
      if (mounted.current && picked[0]) setPhoto(picked[0]);
    })} />}
    {photo && <Button title={busy ? `Uploading ${Math.round(progress * 100)}%` : 'Upload / retry photo'} disabled={busy || !active} onPress={() => void perform(async () => {
      const prefix = profile.role === 'gardner' ? `request-images/${profile.id}` : profile.organization ? `marker-images/${profile.organization.id}` : null;
      if (!prefix) throw new Error('A crew account needs an organization to upload a photo.');
      const key = path ?? `${prefix}/mobile-prototype-${randomUUID()}.jpg`;
      // Persist before S3 write so relaunch can find and delete an interrupted proof.
      await AsyncStorage.setItem(storageKey, key);
      if (!mounted.current) return;
      setPath(key); setProgress(0);
      await photos.upload(photo, key, value => { if (mounted.current) setProgress(value); });
      const resolved = await photos.resolve(key);
      if (mounted.current) { setUrl(resolved); setError(''); }
    })} />}
    {path && <>
      <Button title="Refresh photo" disabled={busy || !active} onPress={() => void perform(async () => {
        const resolved = await photos.resolve(path);
        if (mounted.current) setUrl(resolved);
      })} />
      <Button title="Delete test photo" disabled={busy || !active} onPress={() => void perform(async () => {
        await photos.remove(path);
        await AsyncStorage.removeItem(storageKey);
        if (mounted.current) { setPath(null); setUrl(''); setPhoto(undefined); }
      })} />
    </>}
  </Card>;
}
