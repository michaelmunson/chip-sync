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
export declare type MarkerCreateFormInputValues = {
    contact?: string;
    address?: string;
    position?: string;
    images?: string[];
    type?: string;
};
export declare type MarkerCreateFormValidationValues = {
    contact?: ValidationFunction<string>;
    address?: ValidationFunction<string>;
    position?: ValidationFunction<string>;
    images?: ValidationFunction<string>;
    type?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type MarkerCreateFormOverridesProps = {
    MarkerCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    contact?: PrimitiveOverrideProps<TextAreaFieldProps>;
    address?: PrimitiveOverrideProps<TextFieldProps>;
    position?: PrimitiveOverrideProps<TextAreaFieldProps>;
    images?: PrimitiveOverrideProps<TextFieldProps>;
    type?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type MarkerCreateFormProps = React.PropsWithChildren<{
    overrides?: MarkerCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: MarkerCreateFormInputValues) => MarkerCreateFormInputValues;
    onSuccess?: (fields: MarkerCreateFormInputValues) => void;
    onError?: (fields: MarkerCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: MarkerCreateFormInputValues) => MarkerCreateFormInputValues;
    onValidate?: MarkerCreateFormValidationValues;
} & React.CSSProperties>;
export default function MarkerCreateForm(props: MarkerCreateFormProps): React.ReactElement;