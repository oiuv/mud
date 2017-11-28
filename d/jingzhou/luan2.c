#include <ansi.h>

inherit ROOM;
string look_bei();

void create()
{
	set("short", "乱坟岗");
	set("long", @LONG
这里是一处乱坟岗，到处长满了过人高的长草，听说这里
经常闹鬼，所以没人敢来。一阵冷风刮来，吓的你根根体毛竖
起。前方好像有一座新坟，坟上立有一块碑(bei)。
LONG);

	set("exits", ([
		"west" : __DIR__"luan",
        ]));

	set("item_desc", ([
                "bei" : (: look_bei :),
	]));
set("outdoors", "jingzhou");
	setup();
}

string look_bei()
{
    return
    "\n"
 WHT "\n\n    ###################\n"
         "    ##               ##\n"
         "    ##           爱  ##\n"
         "    ##           女  ##\n"
         "    ##               ##\n"
         "    ##       " NOR + HIR "凌" NOR + WHT "      ##\n"
         "    ##       " NOR + HIR "霜" NOR + WHT "      ##\n"
         "    ##       " NOR + HIR "华" NOR + WHT "      ##\n"
         "    ##               ##\n"
         "    ##       之      ##\n"
         "    ##       墓      ##\n"
         "    ##               ##\n"
         "    ##   凌          ##\n"
         "    ##   退          ##\n"
         "    ##   思          ##\n"
         "    ##   立          ##\n"
         "    ##               ##\n"
         "    ###################\n\n" NOR
    "\n";
}


void init()
{
        add_action("do_move", "move");
}

int do_move(string arg)
{
        object me;
        me = this_player();

        if (! arg || arg != "bei") 
                return notify_fail("你要推什么？\n");

        if ((int)me->query_str() < 30)
                return notify_fail("你将吃奶的劲都用上了，可还是无法把石碑推开。\n");

        if ((int)me->query_skill("force", 1) < 100 )
                return notify_fail("你推了半天，发现石碑还是纹丝不动。\n");

        write(HIY "你扎下马步，深深的吸了口气，将墓碑缓缓的向旁推开，下面露出"
              "一个黑洞洞的入口。\n" NOR);
        message("vision", HIR + me->name() + HIR "双膀用力，将墓碑向旁缓缓推"
                          "开，下面露出一个黑洞洞的入口。\n" NOR , environment(me), ({me}) );
        set("exits/enter", __DIR__"tomb");
        remove_call_out("close_passage");
        call_out("close_passage", 10);
        return 1;
}

void close_passage()
{
        //object room;

        if (! query("exits/enter"))
                return;
        message("vision", HIR "墓碑发出隆隆的声音，缓缓移回原处。\n" NOR, this_object() );
        delete("exits/enter");
}
