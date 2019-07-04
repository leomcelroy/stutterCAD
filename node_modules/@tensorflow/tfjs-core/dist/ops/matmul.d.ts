import { Tensor, Tensor1D, Tensor2D } from '../tensor';
import { TensorLike } from '../types';
declare function matMul_(a: Tensor2D | TensorLike, b: Tensor2D | TensorLike, transposeA?: boolean, transposeB?: boolean): Tensor2D;
declare function outerProduct_(v1: Tensor1D | TensorLike, v2: Tensor1D | TensorLike): Tensor2D;
declare function dot_(t1: Tensor | TensorLike, t2: Tensor | TensorLike): Tensor;
export declare const matMul: typeof matMul_;
export declare const dot: typeof dot_;
export declare const outerProduct: typeof outerProduct_;
export {};
