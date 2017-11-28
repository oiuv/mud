#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "玉室");
        set("long", @LONG
你走进这里，眼前突然大亮，只见一道阳光从上面数十丈
高处的壁缝里照射进来。阳光照正之处，是一间玉室，看来当
年建造者依着这道天然光线，在峰中度准位置开凿而成。石室
中有玉床(bed)、玉桌(table)及玉椅，都雕刻得甚是精致，床
上斜倚着一具骸骨。石室一角有一大一小的两具骸骨。
LONG);
        set("objects", ([ 
                __DIR__"obj/skeleton" : 2,
                __DIR__"obj/skeleton2" : 1,
	]));

    	set("exits", ([ 
       		"east" : __DIR__"diantang",

    	]));

    	set("item_desc", ([
        	"table" : HIW "\n圆桌都是整块从玉石中雕刻出来的，连在地上，圆桌桌"
                          "面刻的\n是一群背上生翅的飞骆驼，花纹极细，刻工甚是精致"
                          "，然而骆\n驼的头和身子却并不连在一起，各自离开了一尺多"
                          "位置。\n" NOR, 

        	"bed" : HIW "\n这是一张玉石雕刻出来的床。\n" NOR,
	]));
    	create_door("east", WHT "小石门" NOR, "west", DOOR_CLOSED);
    	setup();
}

void init()
{
    	add_action("do_climb","climb");
    	add_action("do_move","move");
}

int do_climb(string arg)
{
    	if (! arg || arg != "bed")
        	return notify_fail("你要爬上那里？\n");

    	if (this_player()->query_temp("marks/爬1"))
        	return notify_fail("你已经在玉床上了。\n");

    	message_vision(HIC "只见$N" HIC "一溜身，爬上了玉床。\n" NOR, this_player());
    	this_player()->set_temp("marks/爬1", 1);
        return 1;
}

int do_move(string arg)
{
        object me;
        object room;
        me = this_player();

    	if (! me->query_temp("marks/爬1"))
	{
        	write("什么？\n");
        	return 1;
    	}

        if (! arg || arg != "table")
	{
        	write("你要移动什么？\n");
        	return 1;
    	}

    	if (! (room = find_object(__DIR__"yongdao5")))
        	room = load_object(__DIR__"yongdao5");

    	this_player()->delete_temp("marks/爬1");

    	if (! query("exits/enter"))
	{
            	set("exits/enter", __DIR__"yongdao5");
            	message_vision(HIW "\n$N" HIW "把圆桌边沿缓缓拉动，使桌面所刻骆驼的头"
                               "和身子连在一起，玉床登时露出一个洞口。\n\n" NOR, me);
            	room->set("exits/out", __FILE__);
            	return 1;
    	}
        write("你要移动什么？\n");

        return 1;
}
