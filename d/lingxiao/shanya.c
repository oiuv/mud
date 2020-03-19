#include <ansi.h>
inherit ROOM;

int do_open(string arg);

void create()
{
        set("short", "山崖");
        set("long",
"映照在阳光白云之间的，是一座巍峨之极的大城。只见城墙
高逾三丈，墙头墙垣雪白一片，尽是冰雪。城墙上隐隐有人头晃
动，城头树着一面在罡风中招展的大旗，城楼上面写着三个大字

            " WHT "※※※※※※※※※※※※※※※※
            ※                            ※
            ※" NOR + HIW "     凌      霄      城" NOR + WHT "     ※
            ※                            ※
            ※※※※※※※※※※※※※※※※" NOR "

城门前有一张厚厚的吊桥(bridge)正紧紧关闭着。如果想要进入
的话，必须要请人开(open)才行。\n");

        set("outdoors", "lingxiao");
        set("exits", ([
            	"east"  : __DIR__"cityout",
            	"west"  : __DIR__"cityout1",
            	"down"  : __DIR__"bingti",
        ]));

        set("item_desc", ([
        	"bridge" : WHT "\n这是一张极大的吊桥，乃是凌霄城的一道防线。\n" NOR,
        ]) );
        setup();
}

void init()
{
        add_action("do_open","open");
}

int do_open(string arg)
{
//      object me=this_player();

        if (! arg || arg != "bridge" )
                return notify_fail("你要干嘛？\n");

        message_vision(HIY "\n$N" HIY "运足力气，大叫一声：“开门"
                       "呀！”\n" NOR, this_player());

        message_vision(HIY "只听得城上有人说道：“有人来了，放吊桥"
                       "吧。”\n\n" NOR + HIC "只听得“轧轧轧”响"
                       "了片刻，吊桥缓缓放下，露出一个方方正正的城"
                       "门来。\n" NOR, this_player());

        set("exits/north", __DIR__"gate");
        remove_call_out("close");
        call_out("close", 10, this_object());

        return 1;
}

void close(object room)
{
        message("vision", HIY "只听“嘎嘎嘎嘎”几声，吊桥又被关了"
                          "起来。\n" NOR, room);
        room->delete("exits/north");
}
