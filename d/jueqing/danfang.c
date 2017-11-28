#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "丹房");
        set("long", @LONG
行至这里，顿感炽热更盛，只见里面是间丈许见方的石室。
石室中央摆有一个一人多高的火炉(huo lu)。两名粗工正在搬
堆柴炭，这两人上身赤膊，下身只穿一条牛头短裤，全身大汗
淋漓。
LONG);
        set("exits", ([
               "south"   : __DIR__"shufang",
               "west"    : __DIR__"zhulin3",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
