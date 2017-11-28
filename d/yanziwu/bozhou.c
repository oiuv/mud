#include <ansi.h>
inherit RIVER;

void create()
{
        set("short", "泊舟坞");
        set("long", @LONG
此处一片芦苇，茭白丛中现出一座船坞，大小船只依次排
开。菱花荷叶丛中条条水道 (river)四通八达，由此可乘船离
开燕子坞。湖面系着尾小舟。北面远远望过去有个梯子。
LONG);
        set("arrive_room", "/d/yanziwu/hupan");
        set("exits", ([
                "east"      : __DIR__"pindi",
	        "northdown" : __DIR__"muti",
        ]));
        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu", }));

        set("outdoors", "yanziwu");
        replace_program(RIVER);
}
