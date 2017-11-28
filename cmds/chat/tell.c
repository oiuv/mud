// chat command: tell.c

#include <net/messaged.h>

inherit F_CLEAN_UP;

int main(object user, mapping info)
{
        if (! stringp(info[MSGTO]))
                return MESSAGE_D->error_msg("你要发消息给谁？\n");

        if (! stringp(info[MESSAGE]))
                return MESSAGE_D->error_msg("你要说什么话？\n");

        return MESSAGE_D->send_msg_to(user, info[MSGTO], info[MESSAGE]);
}

