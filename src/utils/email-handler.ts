import { createTransport } from 'nodemailer';
import { emailConfiguration, frontConfiguration } from 'config';

const transporter = createTransport({
  service: emailConfiguration.mailService,
  secure: true,
  auth: {
    user: emailConfiguration.mailCli,
    pass: emailConfiguration.mailPass,
  },
});

export const sendActivationLink = async (
  link: string,
  userMail: string,
  role: string,
): Promise<void> => {
  const mail = {
    from: emailConfiguration.mailCli,
    to: `<${userMail}>`,
    subject: 'Rejestracja konta w aplikacji Head_hunt',
    text: `Twoje konto zostało dodane do aplikacji Head_hunt przez administratora, w celu aktywacji konta oraz rejestracji
        prosimy kliknąć w link poniżej

        link: ${frontConfiguration.registerLinkPath}${role}/${link}`,
    html: `
<style>
    .container {
    min-width: 300px;
    max-width: 800px;
    margin: auto;
    padding: 10px;
    text-align: center;
    }
    .btn {
    background-color: #E02735;
    width: 200px;
    height: 50px;
    margin: 15px auto;
    color: #f7f7f7;
    border-radius: 0;
    border: none;
    font-size: 20px;
    }
    .link{
    color: #f7f7f7;
    margin: 15px auto;
    text-decoration: none;
    text-align: center;
    display: inline-block;
    }
</style>
<div class='container'>
<h1>Potwierdź adres email</h1>
<h3>Twój email: ${userMail}</h3>
<p>Twoje konto zostało dodane do aplikacji <strong>Head_hunt</strong> przez administratora, w celu aktywacji konta oraz rejestracji prosimy kliknąć w link poniżej:</p>
<p><div class='btn'><a class='link' href='${frontConfiguration.registerLinkPath}${role}/${link}'>Link do rejestracji</a></div></p>
<br><small>Jeśli to nie Twój adres email to zignoruj proszę tę wiadomość.</small>
<br><p>Zespół Head Hunt</p>
</div>
`,
  };

  try {
    await transporter.sendMail(mail);
  } catch (err) {
    console.log(err);
    throw new Error('error during mail sending');
  }
};

export const sendResetLink = async (
  link: string,
  userMail: string,
): Promise<void> => {
  const mail = {
    from: emailConfiguration.mailCli,
    to: `<${userMail}>`,
    subject: 'Reset hasła w aplikacji Head_hunt',
    text: `Przesyłamy link do resetu hasła, jeśli to nie ty wysłałeś prośbę o reset, prosimy o usunięcie tej wiadomości.

        link: ${frontConfiguration.resetLinkPath}${link}`,
    html: `
<style>
    .container {
    min-width: 300px;
    max-width: 800px;
    margin: auto;
    padding: 10px;
    text-align: center;
    }
    .btn {
    background-color: #E02735;
    width: 200px;
    height: 50px;
    margin: 15px auto;
    color: #f7f7f7;
    border-radius: 0;
    border: none;
    font-size: 20px;
    }
    .link{
    color: #f7f7f7;
    margin: 15px auto;
    text-decoration: none;
    text-align: center;
    display: inline-block;
    }
</style>
<div class='container'>
<h1>Reset hasła</h1>
<h3>Twój email: ${userMail}</h3>
<p>Przesyłamy link do resetu hasła:</p>
<p><div class='btn'><a class='link' href='${frontConfiguration.resetLinkPath}${link}' >Link do resetu hasła</a></div></p>
<br><small>Jeśli to nie ty wysłałeś prośbę o reset, prosimy o usunięcie tej wiadomości i kontakt z administracją.</small>
<br><p>Zespół Head Hunt</p>
</div>
`,
  };

  try {
    await transporter.sendMail(mail);
  } catch (err) {
    console.log(err);
    throw new Error('error during mail sending');
  }
};
