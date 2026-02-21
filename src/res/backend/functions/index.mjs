const created = new Date().toISOString();

export const hello = {
  created,
  method: 'get',
  path: '/hello',
  description: 'Health sample endpoint',
  responseSample: {
    message: 'Hello from local bfast-functions'
  },
  onRequest: (_, response) => {
    response.status(200).json({message: 'Hello from local bfast-functions'});
  }
};

export const authGuard = {
  created,
  path: '/',
  description: 'Sample guard middleware',
  onGuard: (_, __, next) => {
    next();
  }
};

export const chatEvent = {
  created,
  name: '/chat',
  description: 'Sample socket event',
  requestSample: {
    message: 'hello world'
  },
  onEvent: ({body}, response) => {
    response.announce({message: body?.message ?? 'hello world'});
  }
};

export const everyMinute = {
  created,
  rule: '* * * * *',
  description: 'Sample cron job',
  onJob: () => {
    console.log('[job] everyMinute triggered');
  }
};
