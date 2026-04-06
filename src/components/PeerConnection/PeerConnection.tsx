'use client';

import { useEffect } from 'react';
import { usePeerStore } from '@/store/peerStore';
import { PAGE_MESSAGE_TYPES } from '../types.d';

export function PeerConnection() {
  const sendMessagueAll = usePeerStore((state) => state.sendMessagueAll);

  useEffect(() => {
    window.addEventListener(
      'message',
      function (event) {
        let { cmd, data } = event.data;
        if (cmd == PAGE_MESSAGE_TYPES.ELEMENT_ACTION) {
          if (data.status == 'sending') {
            sendMessagueAll(cmd, data);
          }
        } else if (cmd == PAGE_MESSAGE_TYPES.RESULT_VIDEO_INFO) {
          sendMessagueAll(cmd, data);
        }
      },
      false
    );
  }, [sendMessagueAll]);

  return null;
}