import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import type { Profile, Request, Site } from '@chip-sync/api';
import { requestSummary } from '@chip-sync/domain';
import { Button, Card, Input, Label, useColors } from '../../components/primitives';
import type { Runtime } from '../../platform/runtime';
import { createNativePhotos } from '../../platform/photos';
import { useAuth } from '../../providers/AuthProvider';
import { useForeground } from '../../providers/useForeground';
import { PhotoProof } from './PhotoProof';

type RecordSelection = { kind: 'site' | 'request'; id: string };
export function Workspace({ runtime, userId }: { runtime: Runtime; userId: string }) {
  const { logout } = useAuth();
  const colors = useColors();
  const foreground = useForeground();
  const [profile, setProfile] = useState<Profile>();
  const [error, setError] = useState('');
  const [recordId, setRecordId] = useState('');
  const [kind, setKind] = useState<RecordSelection['kind']>('site');
  const [selection, setSelection] = useState<RecordSelection>();
  const [record, setRecord] = useState<Site | Request>();
  const [images, setImages] = useState<string[]>([]);
  const [updates, setUpdates] = useState(0);
  const [revision, setRevision] = useState(0);
  const [locating, setLocating] = useState(false);
  const map = useRef<MapView>(null);
  const mounted = useRef(true);
  const locateLock = useRef(false);
  const { api, config } = runtime;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    let current = true;
    if (foreground.enabled) api.profile(userId).then(value => { if (current) { setProfile(value); setError(''); } })
      .catch(error => { if (current) setError(error instanceof Error ? error.message : 'Could not load this account’s profile. Check connectivity and retry.'); });
    return () => { current = false; };
  }, [api, userId, foreground.enabled, revision]);
  useEffect(() => {
    let current = true;
    if (!selection || !foreground.enabled) return;
    setError('');
    let receivedUpdate = false;
    const next = (value: Site | Request) => {
      if (!current) return;
      setRecord(value);
      map.current?.animateToRegion({ latitude: value.latitude, longitude: value.longitude, latitudeDelta: 0.035, longitudeDelta: 0.035 });
    };
    const fail = () => { if (current) setError('Record read or subscription failed. Check connectivity and retry.'); };
    const onUpdate = (value: Site | Request) => { receivedUpdate = true; next(value); if (current) setUpdates(count => count + 1); };
    // Subscribe first, then read to minimize the startup gap. Re-read on every foreground/reconnect.
    let stop: (() => void) | undefined;
    try {
      stop = selection.kind === 'site' ? api.watchSite(selection.id, onUpdate, fail) : api.watchRequest(selection.id, onUpdate, fail);
    } catch { fail(); }
    (selection.kind === 'site' ? api.site(selection.id) : api.request(selection.id)).then(value => {
      if (!receivedUpdate) next(value);
    }).catch(fail);
    return () => { current = false; stop?.(); };
  }, [api, selection, foreground.enabled, revision]);
  useEffect(() => {
    let current = true;
    const photos = createNativePhotos();
    setImages([]);
    if (record && foreground.enabled) Promise.all(record.images.slice(0, 8).map(key => photos.resolve(key))).then(value => {
      if (current) setImages(value);
    }).catch(() => { if (current) setError('A record photo could not load. Retry to refresh its signed URL.'); });
    return () => { current = false; photos.dispose(); };
  }, [record, foreground.enabled, revision]);

  const locate = async () => {
    if (locateLock.current) return;
    locateLock.current = true; setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Location was denied. You can continue using the map and loaded records.');
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (mounted.current) map.current?.animateToRegion({ ...location.coords, latitudeDelta: 0.035, longitudeDelta: 0.035 });
    } catch (error) { if (mounted.current) setError(error instanceof Error ? error.message : 'Location unavailable.'); }
    finally { locateLock.current = false; if (mounted.current) setLocating(false); }
  };
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Card>
      <Label>Chip Sync · {config.environment}</Label>
      <Label>{profile ? `${profile.firstName} ${profile.lastName} · ${profile.role}` : 'Loading profile…'}</Label>
      {profile?.organization && <Label>{profile.organization.name}</Label>}
      {__DEV__ && <Label>AWS: {config.outputs.auth.user_pool_id} · {new URL(config.outputs.data.url).host}</Label>}
      <Label>{foreground.enabled ? 'Online · foreground updates enabled' : foreground.connected ? 'Background · updates paused' : 'Offline · reconnect to retry'}</Label>
      <Button title="Sign out" onPress={() => void logout()} />
    </Card>
    <View style={styles.map}>
      <MapView ref={map} provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFill} userInterfaceStyle={colors.background === '#0d1410' ? 'dark' : 'light'}
        initialRegion={{ latitude: 39.5, longitude: -98.35, latitudeDelta: 35, longitudeDelta: 35 }}>
        {record && <Marker identifier={record.id} coordinate={{ latitude: record.latitude, longitude: record.longitude }}
          title={'name' in record ? record.name : requestSummary(record)} description={record.address} pinColor={colors.brand} />}
      </MapView>
    </View>
    <Button title={locating ? 'Locating…' : 'Locate me'} disabled={locating || !foreground.enabled} onPress={() => void locate()} />
    <Card>
      <Label>Load a staging fixture by ID</Label>
      <View style={styles.row}>
        <Button title={kind === 'site' ? '✓ Site' : 'Site'} onPress={() => setKind('site')} />
        <Button title={kind === 'request' ? '✓ Request' : 'Request'} onPress={() => setKind('request')} />
      </View>
      <Input accessibilityLabel="Record ID" placeholder="Site or request ID" value={recordId} onChangeText={setRecordId} autoCapitalize="none" autoCorrect={false} />
      <Button title="Load record" disabled={!profile || !recordId.trim() || !foreground.enabled} onPress={() => {
        setRecord(undefined); setUpdates(0); setSelection({ kind, id: recordId.trim() });
      }} />
      {record && <><Label>{'name' in record ? record.name : requestSummary(record)}</Label><Label>{record.address}</Label></>}
      <Label>Foreground subscription updates received: {updates}</Label>
      {images.map(url => <Image key={url} source={{ uri: url }} accessibilityLabel="Record photo" style={styles.image} onError={() => setError('Photo download failed. Retry to refresh.')} />)}
      {error ? <Label error>{error}</Label> : null}
      <Button title="Retry / refresh" disabled={!foreground.enabled} onPress={() => setRevision(value => value + 1)} />
    </Card>
    {profile && config.environment !== 'production' && <PhotoProof profile={profile} active={foreground.enabled} />}
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 16 }, map: { height: 320, borderRadius: 14, overflow: 'hidden' }, row: { flexDirection: 'row', gap: 8 }, image: { height: 180, borderRadius: 10 } });
