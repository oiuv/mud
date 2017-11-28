#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", NOR + WHT "\n\n                人        间        道" NOR);
        set("long", WHT "\n"
"仿佛踏进了嘈杂的闹市，又如闯进了民家大院。欢笑声、哭泣\n"
"声、怒骂声相互交杂。喜怒哀乐、恩怨情仇，世间百态尽集于\n"
"此。尝尽人间种种酸甜苦辣，悲欢离合。于痛苦中诞生，又于\n"
"痛苦中消逝。怜我世人，忧患实多。怜我世人，忧患实多。\n\n" NOR);
        setup();
}

