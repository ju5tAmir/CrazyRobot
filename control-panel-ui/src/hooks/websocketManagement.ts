import { useEffect, useRef } from "react";

export const useWebSocket = () => {
    const gateway = `ws://crazyrobot.local/ws`;
    const websocketRef = useRef<WebSocket | null>(null);
   const clientIdRef = useRef<string>(getOrCreateClientId());

    useEffect(() => {
        initWebSocket();
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, []);

    const initWebSocket = () => {
        console.log('Trying to open a WebSocket connection...');
        websocketRef.current = new WebSocket(gateway);
        websocketRef.current.onopen = onOpen;
        websocketRef.current.onclose = onClose;
        websocketRef.current.onmessage = onMessage;
    };

    const onOpen = (event: Event) => {
        console.log('Connection opened');
        // 👇 Immediately send a "connect" event with the client ID
    };

    const onClose = (event: CloseEvent) => {
        console.log('Connection closed');
        setTimeout(initWebSocket, 2000);
    };

    const onMessage = (event: MessageEvent) => {
        console.log('Received message:', event.data);
    };

    const sendData = (value: string) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(value);
        } else {
            console.warn('WebSocket is not open. Cannot send message.');
        }
    };



    function getOrCreateClientId(): string {
        let clientId = localStorage.getItem("clientId");
        if (!clientId) {
            clientId = generateClientId();
            localStorage.setItem("clientId", clientId);
        }
        return clientId;
    }

    function generateClientId(): string {
        return Math.random().toString(36).substring(2, 10);
    }
    return { sendData };
};
