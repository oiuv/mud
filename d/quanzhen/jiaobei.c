inherit ROOM;

void create()
{
        set("short", "教碑");
        set("long", @LONG
这里是全真教的教碑所在地，路旁立着一块大碑。再往东
走就是天下闻名的道家玄门正宗--全真教的大门了。北面有条
石阶，不知道通向哪里，往西是下山的路。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "northup" : __DIR__"shijie6",
                "eastup" : __DIR__"damen",
                "west" : __DIR__"shijianyan",
        ]));
        set("objects",([
                CLASS_D("quanzhen") + "/zhao" : 1,
                CLASS_D("quanzhen") + "/zhou" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
