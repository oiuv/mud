// /d/xiakedao/shidong6.c 侠客岛 石洞

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
这是一个石洞，略显狭窄，仅容两人并肩而过。顶壁也甚是低矮，
伸手便可触及。油灯晃动，在身后拉出长长的阴影。脚步踢嗒石洞彼
端响起阵阵回声，感觉有些异样。
LONG );
        set("exits", ([
                "south" : __DIR__"shidong7",
                "north" : __DIR__"shidong1",
        ]));
        setup();
        replace_program(ROOM);
}
