// message.h

#ifndef __MESSAGE_H__
#define __MESSAGE_H__

int  is_loging_now();
int  start_log();
void end_log();
void log_message(string msg);
void log_command(string cmd);
void receive_message(string msgclass, string msg);
void clear_written();
int  is_waiting_command();
void write_prompt();
void receive_snoop(string msg);

#endif
