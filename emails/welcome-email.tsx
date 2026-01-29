import {
    Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr
} from '@react-email/components';

interface WelcomeEmailProps {
    adTitle: string;
    manageLink: string;
    publicLink: string;
}

export const WelcomeEmail = ({
    adTitle,
    manageLink,
    publicLink,
}: WelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Twoje ogłoszenie "{adTitle}" jest już aktywne!</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                <Heading style={{ color: '#333', fontSize: '24px' }}>Twoje ogłoszenie jest online!</Heading>
                <Text style={{ color: '#555', fontSize: '16px' }}>
                    Cześć! Twoje ogłoszenie <strong>"{adTitle}"</strong> zostało dodane.
                </Text>

                <Section style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                    <Text style={{ margin: '0 0 15px' }}>Kliknij poniżej, aby edytować lub usunąć ogłoszenie:</Text>
                    <Button
                        href={manageLink}
                        style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                        Zarządzaj ogłoszeniem
                    </Button>
                    <Text style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>
                        Nie udostępniaj tego linku nikomu!
                    </Text>
                </Section>

                <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

                <Text style={{ fontSize: '14px', color: '#888' }}>
                    Link publiczny: <a href={publicLink} style={{ color: '#556cd6' }}>{publicLink}</a>
                </Text>
            </Container>
        </Body>
    </Html>
);


export default WelcomeEmail;