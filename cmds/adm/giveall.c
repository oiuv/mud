// giveall.c

inherit F_CLEAN_UP;
#include <ansi.h>

int main(object me, string arg)
{
        object ob;
        int count, num = 0;
        string target, gift_file, str;

        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;
                
        if (! arg)  
                return notify_fail("派送礼物给经验超过5万的在线玩家。\n\n"
				                   "命令格式： gift </路径/目标文件名> [数量]\n\n"); 
    
        if (sscanf(arg, "%s %d", target, count) != 2) 
                target = arg;   
        
        if (sscanf(target, "%*s.c") != 1)
                target += ".c";
        gift_file = target; 
        
        if (file_size(gift_file) == -1)
                return notify_fail("路径不正确，您所指定的礼物无法找到。\n");
        
        seteuid(getuid());

        foreach(object player in users())
        {
                ob = new(target); 
                
                if (count > 1 && ob->query("base_unit")) 
                        ob->set_amount(count); 
                if (player->query("combat_exp") > 50000)
                {
                        num++ ;
                        ob -> move(player); 
                        tell_object(player, HIW "\n\n忽然从极高极远的天空中极速降下一只浑身烈焰的"HIR"火凤"HIW"，周身闪耀七彩光芒。\n" NOR);
                        tell_object(player, HIC "它爪下似乎抓着什么东西，突然"HIR"火凤"HIC"松开脚爪，有个东西直向你掉落下来。\n" NOR);
                        tell_object(player, HIG "你猛一提气纵身一跃丈高将此物抓在手中，又潇洒的飘落地面。\n\n" NOR);
                }
        }
        //str = sprintf("共有 %d 位玩家得到了%s。\n\n", sizeof(users()), target->query("name"));    
        str = sprintf("共有 %d 位玩家得到了%s。\n\n", num, target->query("name"));    
        me->start_more(str);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式：giveall 礼品路径 [数量]

给在线的所有玩家发放礼品。
HELP
        );
        return 1;
}
