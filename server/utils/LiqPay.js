import crypto from 'crypto';

export class LiqPay {
  constructor(publicKey, privateKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  str_to_sign(str) {
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('base64');
  }

  cnb_object(params) {
    params.public_key = this.publicKey;
    const data = Buffer.from(JSON.stringify(params)).toString('base64');
    const signature = this.str_to_sign(this.privateKey + data + this.privateKey);
    return { data, signature };
  }
}