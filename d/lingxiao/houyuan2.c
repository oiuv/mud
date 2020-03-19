inherit ROOM;

void create()
{
        set("short","后园");
        set("long",@LONG 
这里重门叠户，是凌霄城上层人物的居所了。一般弟子要是
没什么事，是不能随便进来的。旁边几丛绿竹，郁郁葱葱。屋柱
上尽皆雕镂着雪花六出之形，一盆盆梅花栽种在屋廊之中。比起
外面合围粗的各色梅树，又是别有风情，左边是白万剑的家，右
边是封万里的住所。
LONG);
        set("outdoors", "lingxiao");
        set("exits",([
            	"south"  : __DIR__"houyuan1",  
            	"north"  : __DIR__"bridge", 
            	"west"  : __DIR__"qihan", 
            	"northwest"  : __DIR__"zoulang3", 
            	"northeast"  : __DIR__"zoulang4", 
            	"east"  : __DIR__"fenghuo", 
        ]));
        set("objects", ([ 
           	__DIR__"obj/mei" : 2, 
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

