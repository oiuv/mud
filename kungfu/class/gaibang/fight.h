// fight.h
// 丐帮升袋

int accept_object(object ob, object obj)
{
        object me = this_object();

//      mapping my_fam = me->query("family");
        mapping ob_fam = ob->query("family");

        if (obj->query("id") != "qingzhu ling")
        {
                command("say 啥玩艺？还是自个留着吧。");
                return 0;
        }

        if (! ob_fam || ob_fam["family_name"] != "丐帮")
        {
                command("say 你是从哪里搞来的青竹令？");
                return 0;
        }

        if (ob->query("combat_exp") < 10000)
        {
                command("say 你这种水平简长老怎么会给你青竹令？");
                return 0;
        }

        if (ob->query_temp("have_cloth") && present("po bu", ob))
        {
                command("say 你不是已经有破布么？回去找简长老吧。");
                return 0;
        }

        if ((ob->query("family/beggarlvl") == 0
           && ob->query("combat_exp") <= 10000)
           || (ob->query("family/beggarlvl") == 1
           && ob->query("combat_exp") <= 20000)
           || (ob->query("family/beggarlvl") == 2
           && ob->query("combat_exp") <= 50000)
           || (ob->query("family/beggarlvl") == 3
           && ob->query("combat_exp") <= 100000)
           || (ob->query("family/beggarlvl") == 4
           && ob->query("combat_exp") <= 200000)
           || (ob->query("family/beggarlvl") == 5
           && ob->query("combat_exp") <= 300000)
           || (ob->query("family/beggarlvl") == 6
           && ob->query("combat_exp") <= 500000)
           || (ob->query("family/beggarlvl") >= 7
           && ob->query("combat_exp") <= 800000))
        {
             command("say 就你那点脓水？我看就算了吧。");
             return 0;
        }

        if ((ob->query("family/beggarlvl") == 0
           && me->query("title") == "丐帮一袋弟子")
           || (ob->query("family/beggarlvl") == 1
           && me->query("title") == "丐帮二袋弟子")
           || (ob->query("family/beggarlvl") == 2
           && me->query("title") == "丐帮三袋弟子")
           || (ob->query("family/beggarlvl") == 3
           && me->query("title") == "丐帮四袋弟子")
           || (ob->query("family/beggarlvl") == 4
           && me->query("title") == "丐帮五袋弟子")
           || (ob->query("family/beggarlvl") == 5
           && me->query("title") == "丐帮六袋弟子")
           || (ob->query("family/beggarlvl") == 6
           && me->query("title") == "丐帮七袋弟子")
           || (ob->query("family/beggarlvl") == 7
           && me->query("title") == "丐帮八袋弟子")
           || (ob->query("family/beggarlvl") == 8
           && me->query("title") == "丐帮九袋长老"))
        {
                ob->set_temp("fight_ok", me->query("id"));
                command("say 好吧。既然已有青竹令，那就看你的运气了。");
                destruct(obj);
                return 1;
        }

        command("hmm");
        command("say 你到底懂不懂我们丐帮升袋的规矩？");
        return 0;
}

int accept_fight(object ob)
{
        if (query_competitor() == ob)
                return 1;

        if (is_fighting())
        {
                command("say 你等会，让我把面前的这个家伙放倒再说。");
                return 0;
        }

        if (query("qi") < query("eff_qi") * 2 / 3
           || query("jing") < query("eff_jing") * 2 / 3
           || query("neili") < query("max_neili") * 2 / 3)
        {
                command("say 我现在有点疲倦，待我歇会儿再说。");
                return 0;
        }

        if (ob->query("family/family_name") != query("family/family_name"))
        {
                command("say 免了，我可没兴趣和你动手。");
                return 0;
        }

        if (ob->query_temp("fight_ok") != query("id"))
        {
                command("say 你去向简长老要了青竹令再来找我。");
                return 0;
        }

        ob->delete_temp("fight_ok");

        command("nod");
        command("say 就让我试一试你的身手，看看你究竟有啥水平？");
        competition_with(ob);
        return 1;
}

void lost()
{
        object me, ob;

        me = query_competitor();
        me->set_temp("newtitle", query("title"));
        me->set_temp("have_cloth", 1);

        ob = new("/d/gaibang/npc/obj/po-bu");
        ob->set("owner", me->name(1));
        ob->set("from", this_object()->name(1));
        ob->move(this_object());

        command("say 厉害，厉害。既然你胜过了我，这块破布就拿去吧。");
        command("give po bu to " + me->query("id"));
        ::lost();
}

void win()
{
        object me = query_competitor();

        if (! objectp(me))
        {
                command("heihei");
                return;
        }
        command("say 就你这点水平也想升袋？下去练练再来吧。");
        ::win();
}
