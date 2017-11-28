inherit ROOM;

void create()
{
        set("short", "成德殿后厅");
        set("long", @LONG
这里是日月神教成德殿的后厅。厅内非常的整洁，青石铺
砌的地板被打扫得一尘不染，周围燃着数十支蜡烛，把这里照
得灯火通明。时不时还有身着紫衣的侍者在此走动。
LONG);
        set("exits", ([
                "east" : __DIR__"restroom2",
                "west" : __DIR__"restroom",
                "south":__DIR__"zoulang",
                "north":__DIR__"house1",
        ]));
        set("objects" , ([
             	__DIR__"npc/zish" : 4,
        ]));
        setup();
}

/*
void init()
{
        add_action("do_circle", "circle");
}
*/

int do_circle(string arg)
{

        object me = this_player();
        object room;

        if ((arg != "wan") || ! arg)
          	return notify_fail("你要旋什么？\n");

        if ((int)me->query("str") < 12)
                return notify_fail("你臂力连旋不开什么！\n");

        if (! (room = find_object(__DIR__"didao1")))
	        room = load_object(__DIR__"didao1");

        if (!objectp(room))
		return notify_fail("ERROR:not found 'didao1.c' \n");

        if (! query("exits/down"))
        {
        	set("exits/down", __DIR__"didao1");
          	message_vision("$N将碗旋开，见侧墙打开露，出一个黑幽幽的洞口.\n",me);                    
         	room->set("exits/out", __DIR__"huoting");
         	return notify_fail("一定要抓紧时间，走后将它关上。\n");
        }

        if (! (room = find_object(__DIR__"didao1")))
        	room = load_object(__DIR__"didao1");

        if (! objectp(room))
		return notify_fail("ERROR:not found 'didao1.c' \n");

        if (! query("exits/down"))
        {
        	set("exits/down", __DIR__"didao1");
          	message_vision("$N旋动了碗，只见侧墙打开，露出一个黑幽幽的洞口。\n",me);
          	room->set("exits/out", __DIR__"huoting");
          	message("vision", "外面传来一阵搬动碗的声音，一束光线射了进来。\n", room);
        } else
        {
          	delete("exits/down");
          	message_vision("很快碗又搬回了原位。侧墙上的洞口又被封住了。\n",me);
          	room->delete("exits/out");
          	message("vision", "外面传来一阵搬动碗的声音，洞口被封住了。\n", room);
        }
        return 1;
}
