inherit ROOM; 

#include <ansi.h>;

void create()
{
    set("short", "戏梅亭");
    set("long", @LONG 
这里是凌霄城的戏梅亭，是凌霄城主白自在平时最喜欢来的
地方。从这里俯瞰群山，披襟当风，只觉万里江山，不如金樽一
醉。在厅柱上刻着一句诗(poem)，是白老爷子酒后性至，仗剑所
留。但有人却说白老爷子生平最是好名，这样说是自己打自己嘴
巴，可也没人正直到敢在白老爷子面前讥讽半句。
LONG);
    	set("exits", ([
        	"west" : __DIR__"meiroad3",
    	])); 
        set("objects", ([ 
                __DIR__"obj/ban" : 3,
        ])); 
        set("item_desc", ([
        	"poem" : HIR "\n\n          忍把浮名，换了浅酌低唱。\n\n" NOR,
        ]) );
        setup();
    	set("outdoors", "lingxiao");
    	set("no_clean_up", 0);
    	setup();
        replace_program(ROOM);
}

