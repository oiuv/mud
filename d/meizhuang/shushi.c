inherit ROOM;

void create()
{
        set("short", "书室");
        set("long", @LONG
这里是秃笔翁的书室，房中有一个大案，案上放着一个笔筒，笔
筒中插着几管大小不同的毛笔，毛笔的质料也有所不同，有狼毫，有
羊毫，有猪鬃，有鼠须，还有一支世上很难见到的獭毫笔，案上平铺
着一张四尺中堂大小的宣纸，一方端砚，一柄徽墨，一对白玉镇纸，
一个寿山笔架，都显出主人对书法的爱好。墙上挂满了主人书写的一
幅幅条幅，中堂，对联。 
LONG
        );
        set("exits", ([
                "east" : __DIR__"zoulang1",
        ]));

        set("objects", ([
                CLASS_D("meizhuang") + "/tubi" : 1,
                __DIR__"obj/maobi" : 2,
                __DIR__"obj/panguanbi" : 1,
        ]));

        set("outdoors", "meizhuang");
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
