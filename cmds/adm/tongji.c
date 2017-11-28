#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string str)
{
        object* users;
        int count, i, j;
        
        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;

        users = all_interactive();

        if (wiz_level(me) < 4)
                return 0;
  
        if (! str)
                return notify_fail("你要统计什么技能？\n");

        if (file_size("/kungfu/skill/" + str + ".c") == -1)
                return notify_fail("没有这个技能存在！\n");                

        count = sizeof(users);

        j = 0;
        write(HIW "\n以下为本MUD中掌握 " + HIM + CHINESE_D->chinese(str) + HIW + " 的在线玩家。\n" NOR);
        write(HIY "-------------------------------------------------------------------------\n" NOR);
        for (i = 0; i < count; i ++)
        {
             if (users[i]->query_skill(str, 1))
             {
                  write(HIC + users[i]->name() + "(" + users[i]->query("id") + ") \t\t" NOR);
                  write(HIC "年龄：" + users[i]->query("age") + "\t" NOR);
                  write(HIC "所属门派：" + users[i]->query("family/family_name") + "\t" NOR);
                  write(HIC "等级：" + users[i]->query_skill(str, 1) + "\n" NOR);
                  j ++;
             }
         
        }
        write(HIW "\n总共 " HIR + j + HIW " 位玩家掌握" + HIM + CHINESE_D->chinese(str) + "\n" NOR);
        write(HIY "-------------------------------------------------------------------------\n" NOR);

        return 1;
}

