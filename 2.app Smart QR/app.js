document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrCard = document.getElementById('qr-card');
    const qrCanvas = document.getElementById('qr-canvas');
    const qrCodeWrapper = document.getElementById('qr-code-wrapper');

    // Generate QR Code Function
    function generateQR() {
        const urlText = urlInput.value.trim();
        
        if (!urlText) {
            alert('URL을 입력해주세요.');
            urlInput.focus();
            return;
        }

        // Validate basic URL structure
        let finalUrl = urlText;
        if (!/^https?:\/\//i.test(urlText)) {
            finalUrl = 'https://' + urlText;
        }

        // Generate QR code onto the canvas
        // We use 360px width for high resolution JPG outputs
        QRCode.toCanvas(qrCanvas, finalUrl, {
            width: 360,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        }, (error) => {
            if (error) {
                console.error('QR Code Generation Error:', error);
                alert('QR 코드 생성 중 오류가 발생했습니다.');
                return;
            }

            // Successfully generated, trigger animation
            qrCard.classList.add('has-qr');
        });
    }

    // Trigger on Button Click
    generateBtn.addEventListener('click', generateQR);

    // Trigger on Enter Key
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateQR();
        }
    });

    // Handle JPG Download on click
    qrCodeWrapper.addEventListener('click', () => {
        try {
            // Get the image data URL as JPEG
            // The canvas from QRCode library already has solid white background due to color.light: '#ffffff'
            const dataUrl = qrCanvas.toDataURL('image/jpeg', 1.0);
            
            // Create temporary anchor to trigger download
            const link = document.createElement('a');
            
            // Clean filename based on URL domain or simple default
            let filename = 'jj-smart-qr';
            try {
                const urlVal = urlInput.value.trim();
                const hostname = new URL(urlVal.startsWith('http') ? urlVal : 'https://' + urlVal).hostname;
                if (hostname) {
                    filename = `qr-${hostname.replace('www.', '')}`;
                }
            } catch (e) {
                // Use default filename if parsing fails
            }
            
            link.download = `${filename}.jpg`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            alert('다운로드 중 오류가 발생했습니다.');
        }
    });
});
