import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParseMongoIdPipe } from './parse-mongo-id.pipe';

describe('ParseMongoIdPipe', () => {
  let pipe: ParseMongoIdPipe;

  beforeEach(() => {
    pipe = new ParseMongoIdPipe();
  });

  it('returns the same value when valid ObjectId', () => {
    const id = new Types.ObjectId().toHexString();
    expect(pipe.transform(id, { type: 'param' })).toBe(id);
  });

  it('throws BadRequestException for invalid id', () => {
    const badId = 'not-a-valid-id';
    expect(() => pipe.transform(badId, { type: 'param' })).toThrowError(
      BadRequestException,
    );
  });
});
