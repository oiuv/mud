// qiaofu.c

inherit NPC;

int inquiry_dao();

void create()
{
        set_name("樵夫", ({ "qiao fu","fu" }) );
        set("gender", "男性" );
        set("age", 50);
        set("long", "一个一辈子以砍材为生的老樵夫，由于饱受风霜，显出与年龄不相称的衰老。\n");
        set("shen_type",1);
        set("combat_exp", 10000);
        set("str", 17);
        set("dex", 18);
        set("con", 18);
        set("int", 18);
        set("attitude", "friendly");
        set("inquiry" , ([
            "柴刀" : (: inquiry_dao :),
            "刀" : (: inquiry_dao :),
        ]));
        set_temp("buyed", 0);
        setup();
        carry_object("/clone/misc/cloth")->wear();

}

int accept_object(object who, object ob)
{
        command("smile");
        message_vision("谢谢好心的大爷，好人有好报。\n", who);
        if (ob->query("money_id") && ob->value() >= 3000)
                set_temp("buyed", 1);
        return 1;
}

int inquiry_dao()
{
        object me=this_player();
        object ob;

        if (present("cut knife", me))
        {
            message_vision("你就别寻老头子开心了，你身上不是也有一把吗?\n", me);
            return 1;
        }

        if (query_temp("buyed") == 0)
        {
            message_vision("这位大爷，实在不是我舍不得这刀，小人一家就全靠它过\n"
                  "日子了，给了你，叫我怎么过活啊！\n", me);
            return 1;
        }

        if (query_temp("buyed") == 1)
        {
            message_vision("既然好心人想要，就给你吧，本来史婆婆要我好好保管的，\n"
                  "你可千万别瞎送给别人，否则她会生气的。\n", me);
            ob = new("/d/xiakedao/obj/knife");
            ob->move(me);
            message_vision("樵夫递给你一把柴刀！\n", me);
            set_temp("buyed", 0);
        }
        return 1;
}
