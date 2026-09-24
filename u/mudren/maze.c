#include <ansi.h>

inherit "/inherit/room/illusion_base";


varargs void create(int x, int y, int z) {
    set("short", "心魔幻境");
    set("long", "这里是你的心魔幻境，无边无际，四周灰蒙蒙的，也不知道这里会有什么危险。\n");
    set("maze", "maze");
    setArea("maze", x, y, z);
    set("valid_startroom", 1);
    set("exits", ([
        "north": __DIR__ "maze/" + x + "," + (y + 1) + "," + z,
        "south": __DIR__ "maze/" + x + "," + (y - 1) + "," + z,
        "west": __DIR__ "maze/" + (x - 1) + "," + y + "," + z,
        "east": __DIR__ "maze/" + (x + 1) + "," + y + "," + z,
    ]));
    if (random(3)) {
        removeRandomExit();
        // 随机关闭第二个出口
        if (random(2)) {
            removeRandomExit();
        }
    }

    if (!random(20)) {
        set("long", "这里是无边无际的幻境，在这单调的幻境中有一个闪闪发光的传送门（door），显得格外醒目。\n");
        set("item_desc", ([
            "door": "离开(out)心魔幻境的传送门！\n",
        ]));
        set("exits/out", "/d/city/wumiao2");
    }

    initialize_illusion_inventory(x, y, z);
}

void init() {
    run_illusion_encounter();
}
