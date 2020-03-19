inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short", "中庭");
        set("long", @LONG 
这里是凌霄城的中庭，左右都是凌霄弟子的住所。白自在对
诸弟子要求严厉。所以凌霄弟子平时除练剑习武外，无事之时往
往便在房中研读剑经拳谱，不敢稍有懈怠。 
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"west"  : __DIR__"zoulang1",
            	"north" : __DIR__"houyuan1",  
            	"south" : __DIR__"qianyuan", 
            	"east"  : __DIR__"zoulang2",
        ]));        
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

