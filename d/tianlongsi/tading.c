inherit ROOM;

string look();
void create()
{
        set("short", "塔顶");
        set("long",@LONG
这是舍利塔塔顶，室中孤零零地放着一张供桌(zhuozi)。
LONG );
        set("outdoors", "tianlongsi");
        set("exits", ([
            "down" : __DIR__"ta1",
        ]));
        set("item_desc",([
            "zhuozi" : (:look():),
        ]));	
        set("no_clean_up", 0);
        setup();
}

string look()
{
	object me=this_player();
	me->set_temp("marks/ask_temp0",1);
	return "那是原来供奉舍利子的地方，如今空空如也，看来江湖中传言不虚。\n";
}
