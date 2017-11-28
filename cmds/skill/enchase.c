// enchase.c
// Modify by Rcwiz for hero

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	string item, tessera;
	object obj, dest;

	if (! arg)
                return notify_fail("你要往什么道具上镶嵌物品？\n");

        if (me->is_busy())
                return notify_fail("先忙完了你的事情再做这件事情吧！\n");

        if (me->is_fighting())
                return notify_fail("你现在正在打架，没时间做这些事情。\n");

        if (sscanf(arg, "%s with %s", item, tessera) != 2 &&
            sscanf(arg, "%s in %s", tessera, item) != 2)
                return notify_fail("你要往这上面镶嵌什么物品？\n");

	if (! objectp(obj = present(tessera, me)))
		return notify_fail("你身上没有这样东西可以用来镶嵌。\n");

	if (! objectp(dest = present(item, me)))
		return notify_fail("你身上没有这样道具。\n");

        notify_fail("你无法把" + obj->name() + "镶嵌到" +
                    dest->name() + "上。\n");

        return ITEM_D->do_enchase(me, dest, obj);
	
}

int help(object me)
{
        string msg;

        msg = "\n\n"
"指令格式 : enchase <特殊物品> in <道具>\n"
"           enchase <道具> with <特殊物品>\n\n"
"这个指令可以让你将某样特殊物品镶嵌到另外一种道具上，使得道具\n"
"具有特殊的能力。\n\n"
HIC "「可镶嵌物品列表」\n\n"
"     普通：     神之钻石（电）、神之玛瑙（火）、神之水晶（魔）、神之翡翠（冰）　 （修正：10－30）\n"
"     中等：     五彩玲珑珠（电）、青龙牙（魔）、如意通天镢（冰）、幻地神珠（火） （修正：30－50）\n"
"     高级：     碧魄冰晶、幻石、冰火珠、雷神珠　　　　　　　　　　　　　         （修正：50－70）\n"
"     珍品：　　 神之寒晶·冰、魔之心·魔、火之精灵·火、雷神之瞳·电　　         （修正：90－100）\n\n"
"「特殊合成物品」\n\n"
HIW"      「冰属性」\n" 
"      （可镶嵌｜50－70）  碧魄冰晶     = 极北寒玉 + 青龙牙 + 如意通天镢 + 五彩玲珑珠 + 神聖血清\n"
"      （可镶嵌｜90－100） 神之寒晶·冰 = 碧魄冰晶 + 幻地神珠 + 圣杯　+ 乾坤圣水\n\n"
HIY"      「魔属性」\n"
"      （可镶嵌｜50－70） 幻石          = 八仙石 + 昆仑石 + 如意通天镢 + 五彩玲珑珠 + 神聖血清\n"
"      （可镶嵌｜90－100）魔之心·魔    = 幻石 +　幻地神珠　+ 辉月华石 + 乾坤圣水\n\n"
HIR"      「火属性」\n"
"      （可镶嵌｜50－70） 冰火珠        = 离火玄冰玉 + 幻地神珠 + 雷火寒晶 + 五彩玲珑珠 + 神聖血清\n"
"      （可镶嵌｜90－100）火之精灵·火  = 冰火珠 +　如意通天镢　+ 息壤 + 乾坤圣水\n\n"
HIM"      「电属性」\n"
"      （可镶嵌｜50－70） 雷神珠        =  青龙牙 + 如意通天镢 + 雷火寒晶 + 五彩玲珑珠 + 神聖血清\n"
"      （可镶嵌｜90－100）雷神之瞳·电  =  雷神珠 + 如意通天镢　+ 镇龙石 + 幻地神珠 + 乾坤圣水\n\n" NOR;

    
    msg += HIC "「特殊属性说明」\n\n";
    msg += "      冰：冷冻攻击  伤害精和气血\n";
    msg += "      电：闪电攻击  伤害内力和气血\n";
    msg += "      火：火焰攻击  伤害精和气血\n";
    msg += "      魔：魔法攻击  伤害内力和气血\n\n\n" NOR;

    write(msg);
    return 1;
}
