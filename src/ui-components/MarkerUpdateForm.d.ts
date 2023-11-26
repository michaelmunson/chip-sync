/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type MarkerUpdateFormInputValues = {
    name?: string;
    description?: string;
    contact?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
    type?: string;
};
export declare type MarkerUpdateFormValidationValues = {
    name?: ValidationFunction<string>;
    description?: ValidationFunction<string>;
    contact?: ValidationFunction<string>;
    address?: ValidationFunction<string>;
    latitude?: ValidationFunction<number>;
    longitude?: ValidationFunction<number>;
    images?: ValidationFunction<string>;
    type?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type MarkerUpdateFormOverridesProps = {
    MarkerUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    description?: PrimitiveOverrideProps<TextFieldProps>;
    contact?: PrimitiveOverrideProps<TextAreaFieldProps>;
    address?: PrimitiveOverrideProps<TextFieldProps>;
    latitude?: PrimitiveOverrideProps<TextFieldProps>;
    longitude?: PrimitiveOverrideProps<TextFieldProps>;
    images?: PrimitiveOverrideProps<TextFieldProps>;
    type?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type MarkerUpdateFormProps = React.PropsWithChildren<{
    overrides?: MarkerUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    marker?: any;
    onSubmit?: (fields: MarkerUpdateFormInputValues) => MarkerUpdateFormInputValues;
    onSuccess?: (fields: MarkerUpdateFormInputValues) => void;
    onError?: (fields: MarkerUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: MarkerUpdateFormInputValues) => MarkerUpdateFormInputValues;
    onValidate?: MarkerUpdateFormValidationValues;
} & React.CSSProperties>;
export default function MarkerUpdateForm(props: MarkerUpdateFormProps): React.ReactElement;
