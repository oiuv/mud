// jingang-zhao.c

#include <armor.h>
#include <ansi.h>

inherit CLOTH;
inherit F_NOCLONE;

void create()
{
	set_name("金刚罩", ({ "jingang zhao", "zhao" }));
	set_weight(2000);
	set("unit", "件");
	set("long", @LONG
这是一件金光闪闪的袈裟，通体用天山雪蚕丝织成，坚韧无比刀剑
不能伤。此袈裟数百年前由达摩老祖携入中原，邪魔见之辟易，乃
是佛家无上降魔法宝。
LONG );
	set("material", "cloth");
	set("value",1000000);
	set("no_sell", 1);
	set("wear_msg", HIY "只听「哗」的一声，$N展开一件金光闪闪的袈裟披在身上。
瞬时间日月为之失色，瑞气千条，祥云朵朵，一派庄严气象。\n" NOR);
	set("remove_msg", HIY "$N将金刚罩从身上脱了下来，折叠成小小的一团。\n" NOR);
	set("armor_prop/armor", 220);
        set("stable", 0);
	setup();
        check_clone();
}
