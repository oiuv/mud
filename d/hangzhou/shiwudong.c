inherit ROOM;

void create()
{
        set("short", "石屋洞");
        set("long", @LONG
山路旁是石屋洞。石屋洞，洞中有洞，洞洞相连。主洞高
大宽敞，洁净明亮，上宽下窄，状如浮螺。西上便到了满觉陇
山路的尽头连着一条由北至南的大道。
LONG);
        set("exits", ([
                "westup"    : __DIR__"manjuelong",
                "east"      : __DIR__"road18",
        ]));
        set("objects", ([
                "/clone/worm/changaoxie": 1,
        ]));
        setup();
        replace_program(ROOM);
}

