inherit ROOM;

void create()
{
        set("short", "副殿");
        set("long", @LONG
这里是凌霄城的副殿之一。雪山派五代弟子，除掌门白自在
外，共分四支。各支如果自己派系内有什么事，而又不必提到全
派解决的，往往就在副殿商议。
LONG);
        set("exits",([
            	"west"  : __DIR__"lianwu1",
            	"east"  : __DIR__"dadian",
        ]));
        set("objects", ([
               __DIR__"npc/dizi" : 2,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

