// buwei2.c

inherit ROOM;

void create()
{
        set("short", "寝室");
	set("long", @LONG
这里是岳不群的寝室，岳不群在江湖上人称「君子剑」，他虽为一大
派掌门，可他的卧室却布置的很简单。除了一张床，几只箱子，墙角有张
化妆台，只有靠墙一张红木书桌(desk)还显得略有气派。
LONG
        );
        set("exits", ([ /* sizeof() == 1 */
            "south" : __DIR__"buwei1",
        ]));
	set ("item_desc", ([
		"desk" : 
"这是一张很结实的红木书桌，桌面上摆着几只狼毫笔，磨了一半的墨，\n"
"还有一叠未用的白纸。\n"
	])  ) ;

        set("no_clean_up", 0);
        setup();
}
void init()
{
        add_action("do_move", "move");
}

int do_move(string arg)
{
	object paper;

        if( !arg || arg=="" ) return 0;

        if( arg=="desk" )
	{
		if (!query("hs_trigger"))
		{
			message_vision(
"$N轻轻的推了推书桌，沉重的书桌似乎根本没动...，突然从书桌和\n"
"墙壁之间飘落出一张纸。\n", this_player());
			paper = new(__DIR__"obj/paper");
			paper->move(__FILE__);
			set("hs_trigger", 1);
			return 1;
		}
		message_vision(
"$N轻轻的推了推书桌，沉重的书桌纹丝不动。\n", this_player());
		return 1;
	}
	return 0;
}
