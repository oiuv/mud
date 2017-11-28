//room: /d/mingjiao/westdian.c
inherit ROOM;

void init();

void create()
{
        set("short","明教西侧殿");
        set("long", @LONG
这里是西侧殿，是接待来宾的地方。殿内摆着几张桌子，桌
旁围放数把椅子。墙上悬着几张硬弓，甚是雄壮，旁边堆着一堆
羽箭。窗外是茫茫昆仑雪山，雪峰延绵。
LONG);
       set("exits",([
           "east"     : __DIR__"qiandian",
       ]));
       set("no_clean_up", 0);
       setup();
       replace_program(ROOM);
}

