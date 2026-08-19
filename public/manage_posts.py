import argparse
import json
from datetime import date
from pathlib import Path


POSTS_FILE = Path(__file__).with_name("posts.json")


def load_posts():
    if not POSTS_FILE.exists():
        return []

    with POSTS_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if isinstance(data, list):
        return data

    if isinstance(data, dict) and isinstance(data.get("posts"), list):
        return data["posts"]

    raise ValueError("posts.json must contain a list of posts.")


def save_posts(posts):
    posts = sorted(posts, key=lambda post: post.get("date", ""), reverse=True)

    with POSTS_FILE.open("w", encoding="utf-8") as file:
        json.dump(posts, file, indent=2, ensure_ascii=False)
        file.write("\n")


def add_post(title, body, post_date):
    posts = load_posts()
    posts.insert(0, {
        "title": title.strip(),
        "date": post_date.strip(),
        "body": body.strip()
    })
    save_posts(posts)


def list_posts():
    posts = load_posts()

    if not posts:
        print("No posts found.")
        return

    for number, post in enumerate(posts, start=1):
        print(f"{number}. {post.get('date', 'No date')} - {post.get('title', 'Untitled')}")


def build_parser():
    parser = argparse.ArgumentParser(description="Add or list Catholic Discovery website posts.")
    subparsers = parser.add_subparsers(dest="command")

    add_parser = subparsers.add_parser("add", help="Add a new post to posts.json.")
    add_parser.add_argument("--title", help="Post title.")
    add_parser.add_argument("--body", help="Post body text.")
    add_parser.add_argument("--date", default=date.today().isoformat(), help="Post date in YYYY-MM-DD format.")

    subparsers.add_parser("list", help="List existing posts.")

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "list":
        list_posts()
        return

    if args.command == "add":
        title = args.title or input("Post title: ").strip()
        body = args.body or input("Post body: ").strip()
        post_date = args.date or date.today().isoformat()

        if not title or not body:
            raise SystemExit("Title and body are required.")

        add_post(title, body, post_date)
        print(f"Post added to {POSTS_FILE.name}.")
        return

    parser.print_help()


if __name__ == "__main__":
    main()
