// zitie.c
// zqb

#include <ansi.h>

inherit ITEM;
void setup()
{}
void create()
{
	set_name( "字帖", ({ "zitie", "tie" }));
	set_weight(200);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "本");
		set("long",
			RED
			"\n“满江红”\n"
			"\n"
                        "怒发冲冠，凭阑处，潇潇雨歇。\n"
                        "抬望眼，仰天长啸，壮怀激烈。\n"
                        "三十功名尘与土，八千里路云和月。\n"
                        "莫等闲，白了少年头，空悲切。\n"
                        "\n"
                        "靖康耻，尤未雪；臣子憾，何时灭。\n"
                        "驾长车踏破，贺兰山缺。\n"
                        "壮志饥餐胡虏肉，笑谈渴饮匈奴血。\n"
                        "待从头，收拾旧山河，朝天阙。\n"
               NOR
		);
		set("value", 10000000);
		set("material", "paper");
		set("no_drop", "这样东西不能离开你。\n");
                set("no_get", "这样东西不能离开那儿。\n");
	}
}
