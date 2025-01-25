// video-call.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
})
export class VideoCallComponent {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private peerConnection!: RTCPeerConnection;
  private socket = io('http://localhost:3000'); // Substitua pela URL do backend
  private roomId: string = 'default-room'; // ID fixo ou gerado dinamicamente
  isDisconnected: boolean = false;

  async ngOnInit() {
    this.setupSocketListeners();
    this.joinRoom();

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideo.nativeElement.srcObject = stream;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // Configuração do servidor STUN
    });

    stream.getTracks().forEach((track) => this.peerConnection.addTrack(track, stream));

    this.peerConnection.ontrack = (event) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', { roomId: this.roomId, candidate: event.candidate });
      }
    };

    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
    }
  }

  handleBeforeUnload(event: BeforeUnloadEvent) {
    this.ngOnDestroy(); 
    event.returnValue = 'Tem certeza que deseja sair?'; 
    return true;
  }

  joinRoom() {
    this.socket.emit('join-room', this.roomId); // Entra na sala com o ID especificado
  }

  async startCall() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.socket.emit('offer', { roomId: this.roomId, offer });
  }

  setupSocketListeners() {
    this.socket.on('user-joined', (userId) => {
      console.log(`Usuário ${userId} entrou na sala`);
    });

    this.socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit('answer', { roomId: this.roomId, answer });
    });

    this.socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    this.socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Trata quando um usuário desconecta
    this.socket.on('user-disconnected', (userId) => {
      console.log(`Usuário ${userId} desconectou`);
      this.handleUserDisconnection();
    });
  }

  handleUserDisconnection() {
    this.isDisconnected = true;

    // Fecha a conexão peer-to-peer
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    // Limpa o vídeo remoto
    if (this.remoteVideo && this.remoteVideo.nativeElement) {
      this.remoteVideo.nativeElement.srcObject = null;
    }

    console.log('Conexão encerrada e vídeo remoto limpo.');
  }

  ngOnDestroy() {
    // Notifica que o usuário saiu
    this.socket.disconnect();

    // Fecha a conexão peer-to-peer
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    // Limpa o vídeo local
    if (this.localVideo && this.localVideo.nativeElement) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      const tracks = stream?.getTracks();
      tracks?.forEach((track: { stop: () => any; }) => track.stop());
      this.localVideo.nativeElement.srcObject = null;
    }

    // Limpa o vídeo remoto
    if (this.remoteVideo && this.remoteVideo.nativeElement) {
      this.remoteVideo.nativeElement.srcObject = null;
    }

    console.log('Usuário saiu e vídeos foram limpos.');
  }
}
