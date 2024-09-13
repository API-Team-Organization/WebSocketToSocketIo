import { Test, TestingModule } from '@nestjs/testing';
import { ConversionGateway } from './conversion.gateway';

describe('ConversionGateway', () => {
  let gateway: ConversionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversionGateway],
    }).compile();

    gateway = module.get<ConversionGateway>(ConversionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
