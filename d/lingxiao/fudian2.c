inherit ROOM;

void create()
{
        set("short","副殿");
        set("long",@LONG
这里是凌霄城的副殿之一。几个凌霄弟子正在一起，贼头贼
脑地不知在干什么，鬼鬼祟祟的，准没什么好事。最近凌霄城里
不太平，麻烦事情也挺多的，还是少理为妙。
LONG);
        set("exits",([
            	"east"  : __DIR__"lianwu2",
            	"west"  : __DIR__"dadian",
        ]));
        set("objects", ([
               __DIR__"npc/dizi" : 3,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

