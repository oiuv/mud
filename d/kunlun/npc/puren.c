inherit NPC;

void create()
{
        set_name("仆人", ({"pu ren", "pu"}) );
        set("gender", "男性" );
        set("age", 50);
        set("long", "这是个老实巴交的老仆人，虽然衣服上打了\n"
                    "很多补丁，却是十分的整洁。因为长期待在\n"
                    "厨房里，眼睛被烟熏成了一条缝。\n");
        set("attitude", "friendly");
        set("shen_type", 1);
        setup();

        carry_object("/clone/misc/cloth")->wear();
}
