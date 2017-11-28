// Room: /d/shaolin/bagua.h
// Date: YZC 96/01/19

string* dirs = ({
	"¿²", "À¤", "Àë", "Ç¬",
	"ôŞ", "Õğ", "Ùã", "¶Ò"
	});

int check_dirs(object me, string dir)
{
	int i, bc, count;
	if (member_array(dir, dirs) != -1)
	{
		bc = me->query_temp("bagua/count");

		switch (dir)
		{
		case "¿²":
			if (bc == 0 || bc == 13 || bc == 17) {
				me->set_temp("bagua/count",  bc + 1);
				me->receive_damage("jing",50); }			
			else
				me->delete_temp("bagua/count");
			break;
		case "À¤":
			me->delete_temp("bagua/count");
			break;
		case "Àë":
			if (bc == 1 || bc == 12 ) {
				me->set_temp("bagua/count",  bc + 1);
				me->add("neili", -50); }
			else
				me->delete_temp("bagua/count");
			break;
		case "Ç¬":
			if (bc == 8 ) {
				me->set_temp("bagua/count",  bc + 1);
				me->receive_damage("qi", 50); }
			else
				me->delete_temp("bagua/count");
			break;
		case "ôŞ":
			if (bc == 3 || bc == 4 || bc == 15) {
				me->set_temp("bagua/count",  bc + 1);
				me->add("combat_exp", -50); }
			else
				me->delete_temp("bagua/count");
			break;
		case "Õğ":
			if (bc == 2 || bc == 7 || bc == 9 ) {
				me->set_temp("bagua/count",  bc + 1);
				me->unconcious(); }
			else
				me->delete_temp("bagua/count");
			break;
		case "Ùã":
			if (bc == 6 || bc == 11 ) {
				me->set_temp("bagua/count",  bc + 1);
				me->receive_wound("qi", 50); }
			else
				me->delete_temp("bagua/count");
			break;
		case "¶Ò":
			if (bc == 5 || bc == 10 || bc == 14 || bc == 16) {
				me->set_temp("bagua/count",  bc + 1);
				me->receive_wound("jing", 50); }
			else
				me->delete_temp("bagua/count");
			break;
		default:
			me->delete_temp("bagua/count");
			break;
		}

		if (dir == "À¤")
		{
			me->delete_temp("bagua");
		}
		else
		{
			count =  me->query_temp("bagua/"+dir);
			count++;
			me->set_temp("bagua/"+dir, count);
			if (count > 13)
			{
				me->delete_temp("bagua");
				me->move(__DIR__"jianyu");
				return (1);
			}
		}
	}

/*
	write("* " + me->query_temp("bagua/northwest"));
	write(" " + me->query_temp("bagua/north"));
	write(" " + me->query_temp("bagua/northeast") +"\n");
	
	write("* " + me->query_temp("bagua/west"));
	write(" " + me->query_temp("bagua/count"));
	write(" " + me->query_temp("bagua/east") +"\n");
	
	write("* " + me->query_temp("bagua/southwest"));
	write(" " + me->query_temp("bagua/south"));
	write(" " + me->query_temp("bagua/southeast") +"\n");
*/
	return (0);
}
