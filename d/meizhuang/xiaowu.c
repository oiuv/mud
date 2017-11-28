inherit ROOM;

void create()
{
        set("short", "石屋");
        set("long", @LONG
一间小小的石屋，屋前屋后七八株苍松夭矫高挺，遮得石屋里阴
沉沉的，终日不见什么阳光。石屋内堂正中坐着一位老者，六十来岁
年纪，骨瘦如柴，脸上肌肉都凹了进去，直如一具骷髅，双目却炯炯
有神，正俯首抚琴。石屋四周的墙壁上挂满了各式各样的乐器，任何
一件都有上百或是上千光景，全是名贵之物。
LONG
        );
        set("exits", ([
            "out" : __DIR__"xiaoyuan",
        ]));

        set("objects", ([
                CLASS_D("meizhuang") + "/huang" : 1,
                __DIR__"obj/qin" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
