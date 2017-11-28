// chat command: setenv.c

#include <ansi.h>
#include <net/messaged.h>

#define SET_CMD         "/cmds/usr/set"
#define UNSET_CMD       "/cmds/usr/unset"

inherit F_CLEAN_UP;

int main(object user, mapping info)
{
        string item;
        string index;
        string val;
        int result;
        int made = 0;
        string *chg = ({ });

        seteuid(getuid());

        if (! is_root(previous_object()) ||
            ! geteuid(user))
                return 0;

        if (! info[ARG])
                return MESSAGE_D->error_msg("参数不全。\n");

        // I must be careful here, If some error occur to stop
        // running, the user may be ...
        while (info[ARG] && strlen(info[ARG]))
        {
                if (sscanf(info[ARG], "%s\n%s", item, info[ARG]) != 2)
                {
                        item = info[ARG];
                        info[ARG] = 0;
                }

                result = 0;
                if (sscanf(item, "%s %s", index, val) != 2 ||
                    ! strlen(replace_string(val, " ", "")))
                {
                        // remove the last space of the item
                        if (! (result = UNSET_CMD->main(user, index)))
                                break;
                } else
                {
                        chg += ({ index });
                        if (! (result = SET_CMD->main(user, item)))
                                break;
                }
        }

        if (! result)
                MESSAGE_D->error_msg("不能执行设置参数的要求。\n");
        else
        {
                MESSAGE_D->send_env(user, chg);
                MESSAGE_D->tell_user(user, FUN_NOTICE, "你的配置信息成功的更新了。\n");
        }

        return result;
}

