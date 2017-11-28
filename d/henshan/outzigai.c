#include <ansi.h>
inherit ROOM;

void create()
{
	set("short","水莲洞内");
	set("long",@LONG
走到这里就没有路了，四周都是突起的怪石(stone),洞壁
上渗出的水顺着突石流了下来，水滴溅在地上发出“啪嗒，啪
嗒”的声音，顺着水流向上望去发现水流源头处隐约有一丝光
亮。但是那里离地面很高，站在下面也看不清楚。你往周围一
看，已找不到来时的路了，不禁心下骇然。
LONG);
	
	set("item_desc",([
	      "stone" : HIG "\n只见突石怪异嶙峋，水流正好顺其而下。"
                        "石头上面却已经长满了青苔。\n\n" NOR,
	]));
	
	setup();

}


void init()
{	
	add_action("do_climb",({"climb","pa"}));
	add_action("do_tiao",({"tiao","jump"}));
}

int do_tiao(string arg)
{
	object me = this_player();
	
	if (! arg || arg != "stone")
		return notify_fail("你要往哪儿跳？\n");

	message_vision(HIC "\n$N纵身往突石上一跳，不料上面却长满了青苔，"
                        "$N一个不留神摔了下来，顿时晕了过去。\n\n" NOR,me);
	
	me->unconcious();

	return 1;
}


int do_climb(string arg)
{
	object me = this_player();

	if(! arg || arg != "stone")
		return notify_fail("你要往哪儿爬？\n");

	write(HIC "\n你走到洞壁旁，手拉上面突石，脚踩下面突石，"
              "不一会而便到了高处。\n\n" NOR);

	me->move(__DIR__"outzigai1");

 	return 1;
}

