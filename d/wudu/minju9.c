inherit ROOM;

void create()
{
        set("short", "供桌下");
        set("long", @LONG
你现在蜷缩在低矮的供桌下面，四周到处都是灰尘和蜘蛛
网，稍一抬头就会碰到桌面。这张桌子的四周都被肮脏的布帘
挡住了，你看不到外面的情况，别人也发现不了你。 
LONG);

        set("exits", ([
                "out" : __DIR__"minju7",
        ]));
        setup();
        //replace_program(ROOM);
}
