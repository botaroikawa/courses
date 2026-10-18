import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'react-email'

type ActionEmailProps = {
  lang: string
  siteName: string
  preview: string
  heading: string
  body: string
  action: string
  url: string
  ignore: string
}

// Generic single-call-to-action email used for verification, magic links and password resets
export function ActionEmail({
  lang,
  siteName,
  preview,
  heading,
  body,
  action,
  url,
  ignore,
}: ActionEmailProps) {
  return (
    <Html lang={lang}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>{siteName}</Text>
          <Heading style={styles.heading}>{heading}</Heading>
          <Text style={styles.text}>{body}</Text>
          <Section style={styles.actions}>
            <Button href={url} style={styles.button}>
              {action}
            </Button>
          </Section>
          <Text style={styles.muted}>{url}</Text>
          <Hr style={styles.hr} />
          <Text style={styles.muted}>{ignore}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f6f6f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    margin: '0 auto',
    maxWidth: '480px',
    padding: '32px',
  },
  brand: { color: '#111111', fontSize: '14px', fontWeight: 600, margin: '0 0 24px' },
  heading: { color: '#111111', fontSize: '22px', fontWeight: 600, margin: '0 0 16px' },
  text: { color: '#333333', fontSize: '15px', lineHeight: '24px', margin: '0 0 24px' },
  actions: { margin: '0 0 24px' },
  button: {
    backgroundColor: '#111111',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    padding: '12px 20px',
    textDecoration: 'none',
  },
  hr: { borderColor: '#eeeeee', margin: '24px 0' },
  muted: {
    color: '#888888',
    fontSize: '12px',
    lineHeight: '18px',
    wordBreak: 'break-all' as const,
  },
}
