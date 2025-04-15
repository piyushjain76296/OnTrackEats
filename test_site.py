from selenium import webdriver
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome(executable_path="C:\\webdrivers\\chromedriver.exe")  # Change path if needed

driver.get("http://localhost:5173")  # Or your deployed website URL

time.sleep(3)  # Wait for page to load

print("Website Title:", driver.title)

driver.quit()
