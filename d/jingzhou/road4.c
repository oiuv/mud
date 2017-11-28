#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "青山");
        set("long", @LONG
山中树木茂密，花开万朵，这里风景秀美，小鸟在喳喳地
叫着，阳光从树页的缝隙中照进来，形成五彩的斑斓，你的心
情不由的高兴起来，跟着小鸟的歌声，向前走去。
LONG);
        set("exits", ([
                "northeast" : __DIR__"road3",
                "westup" : __DIR__"qingshan2",
        ]));

        set("no_clean_up", 0);
        set("outdoors", "jingzhou");

        setup();
        replace_program(ROOM);
}

