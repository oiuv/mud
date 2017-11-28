#include <ansi.h>;

inherit ROOM;

void close_bridge();
int do_open(string arg);

void create()
{
        set("short", "凌霄内门");
        set("long", 
"这里是凌霄城的城门。本来凌霄城少有外敌入侵，但由于地
处西域，隆冬之际常有饿狼前来侵袭，故修筑此大城以做为抵挡。
向城内望去，只见人头攘攘，很是繁华，想不到在这西域雪山绝
顶，却有着一个如此去处。内门前那张厚厚的吊桥(bridge)正紧
紧关闭着。如果想要进入的话，必须要请人开(open)才行。
\n");

        set("outdoors", "lingxiao");
        set("exits", ([
                "eastup"  : __DIR__"walle1",
                "westup"  : __DIR__"wallw1",
                "north"  : __DIR__"iceroad1",
        ]));
        set("objects", ([
                CLASS_D("lingxiao") + "/wenwanfu" : 1,
                __DIR__"npc/dizi" : 3,
        ]));
        set("item_desc", ([
        	"bridge" : WHT "\n这是一张极大的吊桥，乃是凌霄城的一道防线。\n" NOR,
        ]) );
        setup();
} 

void init()
{
        add_action("do_open", "open"); 
        add_action("do_close", "close");
} 

void close_bridge()
{
        object room;

        if (!( room = find_object(__DIR__"shanya")) )
                room = load_object(__DIR__"shanya");
        if (objectp(room))
        {
                delete("exits/south");
                message("vision", HIY "几位凌霄弟子上前把吊桥关了起来。\n"
                                  NOR, this_object());
                room->delete("exits/north");
                message("vision", HIY "只听“嘎嘎嘎嘎”几声，吊桥又被关了"
                                  "起来。\n" NOR, room);
        }
}

int do_close(string arg)
{
        if (! query("exits/south"))
                return notify_fail("吊桥已经是关着的了。\n");

        if (!arg || (arg != "bridge" && arg != "south"))
                return notify_fail("你要关什么？\n");

        message_vision(HIY "$N" HIY "朝凌霄弟子招了一下手，几位弟子点了点"
                       "头，上前将吊桥吊了上去。\n" NOR, this_player());

        remove_call_out("close_bridge");
        call_out("close_bridge", 2);

        return 1;
}

int do_open(string arg)
{
        object room;

        if (query("exits/south"))
                return notify_fail("吊桥已经放下来了。\n");

        if (! arg || (arg != "bridge" && arg != "south"))
                return notify_fail("你要开什么？\n");

        if (! ( room = find_object(__DIR__"shanya")) )
                room = load_object(__DIR__"shanya");
        if (objectp(room))
        {
                set("exits/south", __DIR__"shanya");
                message_vision(HIY "$N" HIY "让凌霄弟子把吊桥放了下来。\n" NOR, this_player());
                room->set("exits/north", __FILE__);
                message("vision", HIY "只听“嘎嘎嘎嘎”几声，吊桥被放了下来。\n" NOR, room);
                remove_call_out("close_bridge");
                call_out("close_bridge", 10);
        }

        return 1;
}

int valid_leave(object me, string dir)
{
    	object *inv;
        mapping myfam;
        int i;

        myfam = (mapping)me->query("family");

    	if ((! myfam || myfam["family_name"] != "凌霄城" ) && dir == "north")
        {
        	inv = all_inventory(me);
        	for( i = sizeof(inv)-1; i >= 0; i--)

            	if (inv[i]->query("weapon_prop") && inv[i]->query("skill_type") &&
               	   inv[i]->query("equipped"))

                if (objectp(present("wen wanfu", environment(me))))
                    	return notify_fail(CYN "闻万夫身形一展，挡住你道：凌霄城历年"
                                           "来的规矩，外人入城不得佩带兵刃。\n");
    	}
    	return ::valid_leave(me, dir);
}
