// 查询外敌入侵任务情况的指令

#include <ansi.h>
#define INVASIOND "/adm/daemons/invasion/invasiond"
#define TOTAL_INVADER 24
#define TURN 3600

inherit F_CLEAN_UP;

int main(object me)
{
     int i, len, time;
     string msg, title, name, exist, killer, space, number;
     msg = "";
     space = "                                            ";

     if ( ! find_object(INVASIOND) || ! INVASIOND->query("record") )
     {
        write("现在没有入侵的外敌。\n");
        return 1;
     }

     write(HIW"目前抗击八国联军入侵战况：\n"NOR);
     write(HIM"编号      等级         姓名                状态     杀敌英雄\n"NOR);

     for(i=0; i< TOTAL_INVADER; i++)
     {
        title = INVASIOND->query("record/" + i + "/title");
        name = INVASIOND->query("record/" + i + "/name");
        if  ( INVASIOND->query("record/" + i + "/exist") == 1 )
        {
           exist = HIG"未死"NOR + "   ";
        }  else
        {
           exist = HIR"已死"NOR + "   ";
        }

        killer = INVASIOND->query("record/" + i + "/killer");
        if ( ! killer )  killer = "";
        if (i < 9 )
        {
           number = " " + HIR + (i + 1) + NOR + "  ";
        } else
        {
           number = HIR + (i + 1) + NOR + "  ";
        }
        len = sizeof(name);
        len = 22 - len;
        msg +=  number +
                title + "  " + name + space[0..len] + exist +
                HIG + killer + NOR + "\n";
     }

     write (msg);
     time = ( TURN - time() + INVASIOND->query("record/born_time") ) / 60;
     if ( time < 0 ) time = 0;
     write(HIC"目前距离下一次外敌入侵还有" + time + "分钟。\n");
     return 1;
}

int help(object me)
{
        write(@HELP
这个指令可以让你查询八国联军入侵任务的情况。

HELP);
        return 1;
}

