export const RateLimiterConfiguration = {
  ttl: 60,
  limit: 100000000,
};

export const safetyConfiguration = {
  jwtKey: 'nsnsnoaidoywbytvabsnasoimdaubwvdyaus ijdnw0j2131231',
  password: '123kasndlknjabs2312312laksnaljsbdkjb3222222bjzbsbjb',
  algorithm: 'aes-192-cbc',
  iterations: 24,
  saltLength: 30,
  linkLength: 30,
  cookieExpires: 1000 * 60 * 60 * 24,
};

export const frontConfiguration = {
  domain: 'localhost',
  registerLinkPath: 'http://localhost:3000/register/',
  resetLinkPath: 'http://localhost:3000/reset/',
};

export const emailConfiguration = {
  mailCli: 'applicationheadhunterproject@gmail.com',
  mailPass: 'ptymfpoaqpruhtae',
  mailService: 'gmail',
};

export const fileConfiguration = {
  acceptableFileType: 'application/json',
  maxFileSize: 100000,
};

export const cronConfiguration = {
  returnTime: 10, //days
};
